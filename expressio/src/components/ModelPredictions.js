import { Box, Paper } from '@mui/material';
import PieChart from './PieChart';

function ModelPredictions({ predicted, predictionArr }) {

    var data = [];

    var backgroundColor = [ // Specify background colors for each segment
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
    ]
    var textColor = [ // Specify border colors for each segment
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
    ]

    const labelColorMapping = {
        'ANGRY': textColor[0],
        'HAPPY': textColor[1],
        'SAD': textColor[2],
        'SURPRISE': textColor[3]
    };

    if (predictionArr) {
        data = {
            labels: ['ANGRY', 'HAPPY', 'SAD', 'SURPRISE'],
            values: predictionArr[0]
        };
        console.log(predictionArr);
    }

    return (
        <div style={{ height: '100%' }} className="flex flex-wrap justify-center">
            <Box style={{ height: '100%' }} className="flex flex-col justify-center align-middle w-4/6">
                <Paper elevation={0} className='mb-5 text-center'>
                    {predicted
                        // render predicted expression only if prediction has been made
                        ? (<div className='py-2'>Predicted Expression is
                            <span className='font-bold py-1 px-2' style={{ color: labelColorMapping[predicted] }}>
                                {predicted}
                            </span>
                        </div>)
                        : ("")
                    }
                </Paper>
                <Paper elevation={0}>
                    {predicted
                        // render PieChart only if prediction has been made
                        ? (<PieChart data={data} />)
                        : (<PieChart data={''} />)
                    }
                </Paper>
            </Box>
        </div>
    );
}

export default ModelPredictions;