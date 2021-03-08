import React, { Component } from "react";
import "./Website.css";

export default class Website extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<a
				rel="noreferrer"
				className={this.props.url !== null && this.props.url.length > 0 ? "" : "Website-link-disabled"}
				href={(this.props.url !== null && (this.props.url.startsWith("/") || this.props.url.startsWith("http")) ? "" : "https://") + this.props.url}
				target="_blank">
				<div className={"Website "
                    + (this.props.url !== null && this.props.url.length > 0 ? "" : "Website-disabled")}>
					<i className="fas fa-globe-europe"/>
					<div className={"Website-name"}>
						{this.props.url !== null && this.props.url.length > 0 && this.props.label !== undefined
							&& this.props.label
						}
						{this.props.url !== null && this.props.url.length > 0 && this.props.label === undefined
							&& this.props.url
						}
						{(this.props.url === null || this.props.url.length === 0)
							&& this.props.url
						}
					</div>
				</div>
			</a>
		);
	}
}
