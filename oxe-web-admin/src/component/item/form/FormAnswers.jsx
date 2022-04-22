import React from "react";
import "./FormAnswers.css";

export default class FormAnswers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="FormAnswers" className={"row"}>
				<div className="col-md-12">
					<h2>Answers</h2>
				</div>

				<div className="col-md-12">
					TODO {this.state.aa}
				</div>
			</div>
		);
	}
}
