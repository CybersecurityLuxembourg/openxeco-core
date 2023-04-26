import React from "react";
import mermaid from "mermaid";
import _ from "lodash";

mermaid.initialize({
	startOnLoad: true,
});

export default class Mermaid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			className: _.uniqueId("mermaid-"),
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		mermaid.contentLoaded();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.chart !== this.props.chart) {
			const elements = document.getElementsByClassName(this.state.className);

			for (let i = 0; i < elements.length; i++) {
				elements[i].removeAttribute("data-processed");
			}

			mermaid.contentLoaded();
		}
	}

	render() {
		return (
			<div id="mermaid-chart" className={"mermaid " + this.state.className}>
				{this.props.chart}
			</div>
		);
	}
}
