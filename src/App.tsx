import React, { useState, useEffect } from 'react';
import './App.css';
import { VictoryLine, VictoryChart, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import {StateSelect} from './components/StateSelect'
import usStatesObject from './components/states'

const pctIncrease = (today:number, change:number) => {
  let yesterday = today-change;
  if(change === 0) return 0;

  let pctChange = 1000 * change / yesterday;

  return Math.round(pctChange)/10;
}

const App:React.FC = () => {

  const [statesRaw, setStatesRaw] = useState<any>({});
  const [statesTidy, setStatesTidy] = useState<any>({});

  const [selectedState, setSelectedState] = useState<string>("MT")

  // Get the data and store it in statesRaw
  useEffect(() => {

    const getData = async () => {
    const raw = await fetch('https://covidtracking.com/api/v1/states/daily.json')

    const timeline = await raw.json()

    setStatesRaw(timeline)
    }

    getData()
  }, [])

  /* Format the data so it plays nice with Victory Charts.
     (create an object with an array that contains the time series for each state). */
  useEffect(() => {

    // console.log(statesRaw)
    let tidyCopy = {...statesTidy}

    // Go through the raw data backwards (from first date to most recent date)
    let arrayLength = statesRaw.length-1
    for(let i=arrayLength; i>=0; i--){

      let currentObservation = statesRaw[i]

      // Get the date
      let date = currentObservation.date.toString()

      let year = date.slice(0,4)
      let month = date.slice(4,6)
      let day = date.slice(6,8)

      currentObservation.date = new Date(year, month -1, day)


      // In the next section I'm calculating variables and transfering the data into a object
      // with a key of the state symbol (e.g. "MT") and a value of an array containing
      // the daily observations.

      if( !tidyCopy[currentObservation.state] ) {
        // If the object doesn't have a key for the state already, create one with an empty array
        tidyCopy[currentObservation.state] = []
      } else {
        
        currentObservation.casesPctChange = pctIncrease(currentObservation.positive, currentObservation.positiveIncrease)

        // Copy new data to the appropriate array
        tidyCopy[currentObservation.state] = [currentObservation, ...tidyCopy[currentObservation.state]]
      }
    }

    setStatesTidy(tidyCopy)

  }, [statesRaw])


  return (
    <div className="App">
        <h1>
          US COVID Tracker
        </h1>
        
        <StateSelect onChange={(e) => setSelectedState((e.currentTarget as HTMLInputElement).value)} selected={selectedState}/>

        <VictoryChart
    containerComponent={
          <VictoryVoronoiContainer 
          />
        }>

          
        {statesTidy.MT ?  
        <VictoryLine 
            interpolation="natural"


            style={{
              data: { stroke: "#c43a31" }
            }}

            events={ undefined /**[{
              target: "parent",
              eventHandlers: {
                onMouseEnter: () => {
                  return [
                    {
                      target: "data",
                      eventKey: "all",
                      mutation: (x:any) => {
                        return {style: { stroke: "black", strokeWidth: 5 } }
                      }
                    }
                  ];
                },
                onMouseOut: () => {
                  return [
                    {
                      target: "data",
                      eventKey: "all",
                      mutation: (x:any) => {
                        if(!x.style) return
                        return null
                      }
                    }
                  ];

                }
              }      }] */ 
            } 

            data={statesTidy[selectedState].map((x:any) => {
              return {x: x.date, y: x.positive, label: `${usStatesObject[x.state]} \n ${(x.date as Date).toDateString()} \n ${x.positive} cases (${x.casesPctChange > 0 ? '+' : ''}${x.casesPctChange}%)`}
            })}
            

            
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ stroke: "tomato", strokeWidth: 1 }} 
                /> }
                
            /> : null
          }
          
        </VictoryChart>
    </div>
  );
}



export default App;
