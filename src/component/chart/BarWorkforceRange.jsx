import React from "react";
import {Bar} from 'react-chartjs-2';


export default class BarWorkforceRange extends React.Component {

	constructor(props){
		super(props);

		this.getData = this.getData.bind(this);

		this.state = {
			labels: ["0-10", "11-20", "21-50", "51-100", "101-250", "251-500", "501-1000", ">= 1001"],
			ranges: [10, 20, 50, 100, 250, 500, 1000, Number.MAX_VALUE],
		}
	}

	getData() {
		let data = this.state.ranges.map(o => { return 0 });
		let acceptedIDs = this.props.actors.map(a => { return a.id })

		for (let i in this.props.workforces) {
			if (acceptedIDs.indexOf(this.props.workforces[i].company) >= 0) {
				for (let y in this.state.ranges) {
					if (this.props.workforces[i].workforce <= this.state.ranges[y]) {
						if (this.props.companiesAsGranularity) {
							data[y] += 1;	
						} else {
							data[y] += this.props.workforces[i].workforce;
						}
						break;
					}
				}
			}
		}

		return data;
	}

	getPastDate(years) {
		let date = new Date();
		date.setFullYear(date.getFullYear() - years)
		return date.toISOString().split('T')[0]
	}

    render() {
        return (
            <Bar 
				data={{
				  labels: this.state.labels,
				  datasets: [{
				      data: this.getData(),
				      borderWidth: 1,
				       borderColor: this.state.ranges.map(o  => { 
				      	return typeof this.props.selected !== "undefined" 
				      		&& this.props.selected[1] === o ? '#e40613' : '#009fe3'
				       }),
			          backgroundColor: this.state.ranges.map(o  => { 
				      	return typeof this.props.selected !== "undefined" 
				      		&& this.props.selected[1] === o ? '#fed7da' : "#bcebff" 
				       }),
				  }],
				}} 
				options={{
					legend: {
				        display: false
				    },
					scales: {
					    yAxes: [
					      {
					        ticks: {
					          beginAtZero: true,
					        },
					      },
					    ],
					  },
					onClick: (mouseEvent, data) => {
						if (data.length > 0) {
					    	this.props.addRangeFilter([
					    		data[0]._index > 0 ? this.state.ranges[data[0]._index - 1] + 1 : 0,
					    		this.state.ranges[data[0]._index],
					    	]);
						}
				    }
				}}
			/>
        );
    }
}