
<?php
include "weather.php";
$city_name ="yangon";
function fetch_weather
()
{
global $city_name;
global $connection;
// if($_GET['q']){
//     $city_name = $_GET['q'];

// }else{
//     $city_name = "";
// }
$api_key = "c4f44909178001c5d1c9d0add3948cdb";
$url = "https://api.openweathermap.org/data/2.5/weather?q=".$city_name."&appid=$api_key&units=metric";
$json_data = file_get_contents($url);
$response_data = json_decode($json_data,true);
var_dump($response_data);
echo "ere" . $json_data;

$Date= $response_data["dt"];
$newDate = date('Y-m-d H:i:s', strtotime($Date));
$City = $response_data["name"];
$Icon = $response_data["weather"][0]['icon'];
echo $Date . "Here is the date";
$Temperature = $response_data["main"]["temp"];
$WeatherCondition = $response_data["weather"][0]["description"];
$Humidity = $response_data["main"]["humidity"];
$WindSpeed = $response_data["wind"]["speed"];

$existingData = "SELECT * FROM weatherdata WHERE city = '$City'";
$result = mysqli_query($connection,$existingData);
if(mysqli_num_rows($result)>0){
    echo "City already in database";
}else {
    $insertData = "INSERT INTO weatherdata (Date,City,Icon,Temperature,WeatherCondition,Humidity,WindSpeed) VALUES('$newDate','$City','$Icon',$Temperature,'$WeatherCondition',$Humidity,$WindSpeed";
    if(mysqli_query($connection,$insertData)){
        echo "Data Insert";
        print_r($Date);
    }else{
        echo "Failed to insert data".mysqli_error($connection);
    }
}
}

fetch_weather();





?>




