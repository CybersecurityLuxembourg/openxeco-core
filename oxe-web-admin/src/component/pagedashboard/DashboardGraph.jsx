import React from "react";
import "./DashboardGraph.css";

export default class DashboardGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div id={"DashboardGraph"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Network graph</h1>
					</div>

					<div className="col-md-6 row-spaced">
						<h4>
							<i className="fas fa-building"/>
							<br/>
							Network graph
						</h4>

						{this.state.Ee}
					</div>
				</div>
			</div>
		);
	}
}
