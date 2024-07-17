// Importing necessary components and libraries
import UserInput from './UserInput'; // Component for user input
import ModelPredictions from './ModelPredictions'; // Component for model predictions
import backgroundImage from '../assets/background.jpg';
import Grid from '@mui/material/Grid'; // Grid component from Material-UI
import { useState } from 'react'; // useState hook for managing state

function HomePage() {
    // State variables for predicted value and prediction array
    const [predicted, setPredicted] = useState('');
    const [predictionArr, setPredictionArr] = useState('');

    // Render function
    return (
        <div style={{ height: '100vh', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
            < Grid style={{ height: '100%' }
            } container spacing={1} >
                {/* UserInput component */}
                < Grid item xs={12} md={6} >
                    <UserInput setPredicted={setPredicted} setPredictionArr={setPredictionArr} />
                </Grid >
                {/* ModelPredictions component */}
                < Grid item xs={12} md={6} >
                    <ModelPredictions predicted={predicted} predictionArr={predictionArr} />
                </Grid >
            </Grid >
        </div >
    );
}

export default HomePage;
