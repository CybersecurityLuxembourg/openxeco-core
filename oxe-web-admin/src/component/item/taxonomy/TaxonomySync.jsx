import React from "react";
import "./TaxonomySync.css";

export default class TaxonomySync extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Synchronization</h2>
				</div>
			</div>
		);
	}
}
