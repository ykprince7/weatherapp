<?php
header('Content-Type: application/json; charset=utf-8');

// Database reqirements
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'weather';

// Establish a database connection
$connection = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Decode JSON data from the request body
    $postData = json_decode(file_get_contents("php://input"), true);

    if ($postData) {
        // Extract data from the JSON
        $cityName = $postData['cityName'];
        $tempInCelsius = $postData['tempInCelsius'];
        $weathercondition = $postData['weatherCondition'];
        $humidity = $postData['humidity'];
        $windSpeed = $postData['windSpeed'];
        $icon = $postData['base64Icon'];

        // Decode base64 image data
        $weatherIcon = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $icon));

        // Prepare and execute the SQL INSERT statement
        $stmt = $connection->prepare("INSERT INTO weatherdata (City, Temperature, WeatherCondition, Humidity, WindSpeed, Icon) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $cityName, $tempInCelsius, $weathercondition, $humidity, $windSpeed, $weatherIcon);
        $stmt->execute();
        $stmt->close();
    } else {
        
        // echo "No data received.";
    }
} else {
    
    // echo "Invalid request method.";
}

// Check if the 'city' parameter is set in the GET request
if (isset($_GET['city'])) {
    $city = $_GET['city'];

    // Prepare and execute the SQL SELECT statement with a specific city
    $query = "SELECT * FROM weatherdata WHERE City = ? ORDER BY id ASC";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // If no city is specified, fetch all data
    $query = "SELECT * FROM weatherdata";
    $result = $connection->query($query);
}

// Check if there was an error in executing the SQL query
if (!$result) {
    echo json_encode(array("error" => "Error fetching weather data."));
} else {
    // Fetch data from the result set and encode it as JSON
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

// Close the database connection
$connection->close();
?>
