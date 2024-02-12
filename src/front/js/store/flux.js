const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			weatherData: {},
			energyPrice: {},
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			]
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getWhederApi: () => {
				const apiUrl = 'https://www.meteosource.com/api/v1/free/point';
				const lat = '40.42N';
				const lon = '3.67W';
				const sections = 'all';
				const timezone = 'Europe/Madrid';
				const language = 'en';
				const units = 'metric';
				const apiKey = '1chx712v8et7cm5osnvrbxyd42r0tkqv7q5to9ea';

				fetch(`${apiUrl}?lat=${lat}&lon=${lon}&sections=${sections}&timezone=${timezone}&language=${language}&units=${units}&key=${apiKey}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
				})
				.then(response => response.json())
				.then(data => {
					setStore({ weatherData: data });
					console.log(data)
				})
				.catch(error => {
				console.error('Error al obtener los datos meteorológicos:', error);
				});
			},
			getEnergyPriceApi: () => {
				fetch("https://api.preciodelaluz.org/v1/prices/all?zone=PCB", {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Origin': 'https://effective-bassoon-5w567gjr7rpf4p4-3000.app.github.dev/'
					}
				})
				.then(response => response.json())
				.then(data => {
					const formattedData = {};
			
					Object.keys(data).forEach(key => {
						const hourRange = key.split('-');
						const startHour = parseInt(hourRange[0], 10);
						const formattedHour = startHour < 10 ? `0${startHour}:00:00` : `${startHour}:00:00`;
						const updatedData = { ...data[key], hour: formattedHour };
						formattedData[formattedHour] = updatedData;
					});
			
					setStore({ energyPrice: formattedData });
					console.log(formattedData);
				})
				.catch(error => {
					console.error('Error al obtener los datos de energía:', error);
				});
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
