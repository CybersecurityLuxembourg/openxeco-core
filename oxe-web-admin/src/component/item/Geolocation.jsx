import React from "react";
import "./Geolocation.css";
import Item from "./Item.jsx";

export default class Geolocation extends Item {
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
				className={"Item Geolocation" + (this.props.selected ? " Geolocation-selected" : "")}
				onClick={() => this.onClick()}
			>
				<i className="fas fa-map-marker-alt"/>
				<div className={"name"}>
					{this.props.lat} - {this.props.lon}
				</div>
			</div>
		);
	}
}
