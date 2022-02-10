import React from "react";
import { Bar } from "react-chartjs-2";
import { getPastDate } from "../../utils/date.jsx";

export default class BarActorAge extends React.Component {
	constructor(props) {
		super(props);

		this.getData = this.getData.bind(this);

		this.state = {
			labels: [">= 20 years", "15-19 years", "10-14 years", "5-9 years", "< 5 years"],
			ranges: [20, 15, 10, 5, 0],
		};
	}

	getData() {
		const data = this.state.ranges.map(() => 0);
		const dates = this.state.ranges.map((o) => getPastDate(o));

		for (let i = 0; i < this.props.actors.length; i++) {
			for (let y = 0; y < dates.length; y++) {
				if (this.props.actors[i].creation_date < dates[y]) {
					data[y] += 1;
					break;
				}
			}
		}

		return data;
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
							&& this.props.selected[0] === o ? "#e40613" : "#009fe3")),
						backgroundColor: this.state.ranges.map((o) => (typeof this.props.selected !== "undefined"
							&& this.props.selected[0] === o ? "#fed7da" : "#bcebff")),
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
								this.state.ranges[data[0]._index],
								// eslint-disable-next-line no-underscore-dangle
								data[0]._index > 0 ? this.state.ranges[data[0]._index - 1] - 1 : Number.MAX_VALUE,
							]);
						}
					},
				}}
			/>
		);
	}
}
