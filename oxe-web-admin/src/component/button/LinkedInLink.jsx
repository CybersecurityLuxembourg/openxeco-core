import React, { Component } from "react";
import "./LinkedInLink.css";

export default class LinkedInLink extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	buildUrl() {
		if (!this.props.text || !this.props.url) {
			return undefined;
		}

		let url = "http://www.linkedin.com/shareArticle?mini=false";

		if (this.props.text) {
			url += "&title=" + this.props.text.replaceAll("/", "%2F").replaceAll(":", "%3A");
		}

		if (this.props.url) {
			url += "&url=" + this.props.url.replaceAll("/", "%2F").replaceAll(":", "%3A");
		}

		return url;
	}

	render() {
		return <div className="LinkedInLink">
			<a
				className="LinkedInLink-link"
				href={this.buildUrl()}
				disabled={this.props.text}
				target="_blank"
				rel="noreferrer">
				<i
					className="fab fa-linkedin-in"
				/>
			</a>
		</div>;
	}
}
