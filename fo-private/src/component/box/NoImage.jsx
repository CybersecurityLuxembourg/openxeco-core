import React from "react";
import "./NoImage.css";

export default class NoImage extends React.Component {
	render() {
		return (
			<div className="NoImage" style={{ height: this.props.height ? this.props.height : "100%" }}>
				<div className="NoImage-logo">
					<i className="fas fa-shield-alt"/>
				</div>
			</div>
		);
	}
}
