import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";

export const Apis = () => {
    const { store, actions } = useContext(Context);
    const [bestHour, setBestHour] = useState(null);
    const [mostExpensiveHour, setMostExpensiveHour] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const currentHour = new Date().getHours();

    useEffect(() => {
        const fetchWeatherAndEnergyData = async () => {
            try {
                await Promise.all([actions.getWhederApi(), actions.getEnergyPriceApi()]);
                setDataLoaded(true);
            } catch (error) {
                console.error("Error al traer los datos");
            }
        };

        fetchWeatherAndEnergyData();
    }, []);

    useEffect(() => {
        if (dataLoaded && store.weatherData && store.weatherData.hourly) {
            const energyPriceData = Object.values(store.energyPrice);
            const hourlyWeatherData = store.weatherData.hourly.data;
    
            let lowestPrice = Infinity;
            let highestTemperature = -Infinity;
            let bestHour = null;
            let highestPrice = -Infinity;
            let mostExpensiveHour = null;
    
            energyPriceData.forEach(priceData => {
                const price = parseFloat(priceData.price);
                const hour = parseInt(priceData.hour.split("-")[0], 10);
            
                // Filtrar horas entre las 6 am y las 23 pm
                if (hour >= 6 && hour <= 23 && hour > currentHour) {
                    const weatherHourData = hourlyWeatherData.find(hourData => {
                        const hourInData = new Date(hourData.date).getHours();
                        return hourInData === hour;
                    });
            
                    if (weatherHourData && weatherHourData.precipitation && weatherHourData.precipitation.type === "none") {
                        const temperature = parseFloat(weatherHourData.temperature);
                        if (price < lowestPrice && temperature > highestTemperature) {
                            lowestPrice = price;
                            highestTemperature = temperature;
                            bestHour = priceData.hour.split("-")[0];
                            bestHour = bestHour.padStart(2, '0');
                        }
                        if (price > highestPrice) {
                            highestPrice = price;
                            mostExpensiveHour = priceData.hour.split("-")[0];
                            mostExpensiveHour = mostExpensiveHour.padStart(2, '0');
                        }
                    }
                }
            });
    
            if (bestHour !== null) {
                setBestHour(bestHour);
            }
            if (mostExpensiveHour !== null) {
                setMostExpensiveHour(mostExpensiveHour);
            }
        }
    }, [dataLoaded, store.weatherData, store.energyPrice, currentHour]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6">
                    {store.weatherData && store.weatherData.current && (
                        <div>
                            <h2>Información del Clima</h2>
                            <p>Temperatura actual: {store.weatherData.current.temperature} °C</p>
                            <div className="row mt-4">
                                <div className="col">
                                    {bestHour && (
                                        <div>
                                            <p>La mejor hora es: {bestHour}</p>
                                            {store.energyPrice && store.energyPrice[bestHour] && (
                                                <p>Precio de la energía: {store.energyPrice[bestHour].price} {store.energyPrice[bestHour].units}</p>
                                            )}
                                            {store.weatherData && store.weatherData.hourly.data && (
                                                <p>Temperatura en la mejor hora: {store.weatherData.hourly.data.find(hourData => new Date(hourData.date).getHours() === parseInt(bestHour)).temperature} °C</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="col">
                                    {mostExpensiveHour && (
                                        <div>
                                            <p>La hora más cara es: {mostExpensiveHour}</p>
                                            {store.energyPrice && store.energyPrice[mostExpensiveHour] && (
                                                <p>Precio de la energía: {store.energyPrice[mostExpensiveHour].price} {store.energyPrice[mostExpensiveHour].units}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3>Previsión Horaria</h3>
                            <ul>
                                {store.weatherData.hourly.data.map(hourData => (
                                    <li key={hourData.date}>
                                        <p>Hora: {new Date(hourData.date).toLocaleTimeString()}</p>
                                        <p>Temperatura: {hourData.temperature} °C</p>
                                        <p>Descripción: {hourData.summary}</p>
                                        {hourData.precipitation && (
                                            <p>Tipo de Precipitación: {hourData.precipitation.type}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="col-md-6">
                    {store.energyPrice && (
                        <div>
                            <h2>Precios de Energía</h2>
                            <ul>
                                {Object.values(store.energyPrice).map(priceData => (
                                    <li key={priceData.hour}>
                                        <p>Hora: {priceData.hour}</p>
                                        <p>Fecha: {priceData.date}</p>
                                        <p>Precio: {priceData.price} {priceData.units}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
    
        </div>
    );
    
    
};