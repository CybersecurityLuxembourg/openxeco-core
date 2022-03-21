import React, { Component } from "react";
import "./TwitterLink.css";

export default class TwitterLink extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	buildUrl() {
		if (!this.props.text || !this.props.url) {
			return undefined;
		}

		let url = "https://twitter.com/intent/tweet?";
		const textSize = Math.min(this.props.text.length,
			280 - (this.props.url ? this.props.url.length + 4 : 0));

		if (this.props.text) {
			url += "text="
				+ (this.props.text.length === textSize
					? this.props.text
					: this.props.text.slice(0, textSize) + "...")
					.replaceAll("/", "%2F").replaceAll(":", "%3A");
		}

		if (this.props.url) {
			if (url.charAt(url.length - 1) !== "?") {
				url += "&";
			}
			url += "url=" + this.props.url.replaceAll("/", "%2F").replaceAll(":", "%3A");
		}

		return url;
	}

	render() {
		return <div className="TwitterLink">
			<a
				className="TwitterLink-link"
				href={this.buildUrl()}
				disabled={this.props.text}
				target="_blank"
				rel="noreferrer">
				<i
					className="fab fa-twitter"
				/>
			</a>
		</div>;
	}
}
