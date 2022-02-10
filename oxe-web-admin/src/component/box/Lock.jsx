import React from "react";
import "./Lock.css";

export default class Lock extends React.Component {
	render() {
		return (
			<div className="Lock" style={{ height: this.props.height ? this.props.height : 0 }}>
				<div className="Lock-logo">
					<i className="fas fa-lock"/>
				</div>
			</div>
		);
	}
}
