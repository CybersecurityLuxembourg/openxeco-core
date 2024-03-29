import React from "react";
import "./Message.css";

export default class Message extends React.Component {
	render() {
		return (
			<div
				className={"Message" + (this.props.className ? " " + this.props.className : "")}
				style={{ height: this.props.height ? this.props.height : "100px" }}>
				<div className="Message-text">
					{this.props.text}
				</div>
			</div>
		);
	}
}
