import React, { Component } from "react";
import "./Geolocation.css";

export default class Geolocation extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);

		this.state = {
		};
	}

	onClick() {
		const newState = !this.props.selected;
		if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
	}

	render() {
		return (
			<div
				className={"Geolocation" + (this.props.selected ? " Geolocation-selected" : "")}
				onClick={() => this.onClick()}
			>
				<i className="fas fa-map-marker-alt"/>
				<div className={"Geolocation-name"}>
					{this.props.lat} - {this.props.lon}
				</div>
			</div>
		);
	}
}
