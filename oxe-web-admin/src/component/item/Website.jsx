import React from "react";
import "./Website.css";
import Item from "./Item.jsx";

export default class Website extends Item {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<a
				rel="noreferrer"
				className={this.props.url && this.props.url.length > 0 ? "" : "Website-link-disabled"}
				href={(this.props.url && (this.props.url.startsWith("/") || this.props.url.startsWith("http")) ? "" : "https://") + this.props.url}
				target="_blank">
				<div className={"Item Website "
                    + (this.props.url && this.props.url.length > 0 ? "" : "Item-disabled")}>
					<i className="fas fa-globe-europe"/>
					<div className={"name"}>
						{this.props.url && this.props.url.length > 0
							? this.props.url
							: "No website"
						}
					</div>
				</div>
			</a>
		);
	}
}
