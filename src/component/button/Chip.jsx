import React, { Component } from "react";
import "./Chip.css";
import CheckBox from "./CheckBox";

export default class Chip extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="Chip">
				<div className="Chip-head">{this.props.label[0]}</div>
				<div className="Chip-content">{this.props.label}</div>
				<div className="Chip-close">
					<i
						className="fas fa-times"
						onClick={() => this.props.onClick(this.props.value)}
					/>
				</div>
			</div>
		);
	}
}
