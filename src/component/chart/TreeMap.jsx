import React from "react";
import ChartComponent from 'react-chartjs-2';
import 'chartjs-chart-treemap';


export default class TreeMap extends React.Component {
    render() {
        return (
            <ChartComponent
                {...this.props}
                ref={ref => this.chartInstance = ref && ref.chartInstance}
                type='treemap'
            />
        );
    }
}