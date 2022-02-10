import React from "react";
import { Bar } from "react-chartjs-2";

export default class BarWorkforceRange extends React.Component {
	constructor(props) {
		super(props);

		this.getData = this.getData.bind(this);

		this.state = {
			labels: ["0-10", "11-20", "21-50", "51-100", "101-250", "251-500", "501-1000", ">= 1001"],
			ranges: [10, 20, 50, 100, 250, 500, 1000, Number.MAX_VALUE],
		};
	}

	getData() {
		const data = this.state.ranges.map(() => 0);
		const acceptedIDs = this.props.actors.map((a) => a.id);

		for (let i = 0; i < this.props.workforces.length; i++) {
			if (acceptedIDs.indexOf(this.props.workforces[i].company) >= 0) {
				for (let y = 0; y < this.state.ranges.length; y++) {
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

	static getPastDate(years) {
		const date = new Date();
		date.setFullYear(date.getFullYear() - years);
		return date.toISOString().split("T")[0];
	}

	render() {
		return (
			<Bar
				data={{
					labels: this.state.labels,
					datasets: [{
						data: this.getData(),
						borderWidth: 1,
						borderColor: this.state.ranges.map((o) => (typeof this.props.selected !== "undefined"
							&& this.props.selected[1] === o ? "#e40613" : "#009fe3")),
						backgroundColor: this.state.ranges.map((o) => (typeof this.props.selected !== "undefined"
							&& this.props.selected[1] === o ? "#fed7da" : "#bcebff")),
					}],
				}}
				options={{
					legend: {
						display: false,
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
								// eslint-disable-next-line no-underscore-dangle
								data[0]._index > 0 ? this.state.ranges[data[0]._index - 1] + 1 : 0,
								// eslint-disable-next-line no-underscore-dangle
								this.state.ranges[data[0]._index],
							]);
						}
					},
				}}
			/>
		);
	}
}
