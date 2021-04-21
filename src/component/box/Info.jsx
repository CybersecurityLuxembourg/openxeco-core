import React from "react";
import "./Info.css";
import dompurify from "dompurify";

export default class Info extends React.Component {
	render() {
		return (
			<div className="Info">
				<div className="Info-logo">
					<i className="fas fa-info-circle"/>
				</div>
				<div className="Info-content">
					<div dangerouslySetInnerHTML={{
						__html: dompurify.sanitize(this.props.content),
					}}/>
				</div>
			</div>
		);
	}
}
