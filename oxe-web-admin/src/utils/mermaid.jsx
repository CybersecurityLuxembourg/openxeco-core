import React from "react";
import Mermaid from "react-mermaid";

export default class Mermaid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chart: this.props.chart || "",
		};

		mermaid.initialize({
			mermaid: {
				startOnLoad: false,
			},
		});

		this.mermaidRef = React.createRef();
	}

	mermaidUpdate() {
		const cb = (svgGraph) => {
			this.mermaidRef.current.innerHTML = svgGraph;
		};

		mermaid.mermaidAPI.render("id0", this.state.chart, cb.bind(this));
	}

	componentDidMount() {
		this.mermaidUpdate();
	}

	componentDidUpdate(prevProps) {
		if (this.props.chart !== prevProps.chart) {
			this.setState({ chart: this.props.chart }, () => {
				this.mermaidUpdate();
			});
		}
	}

	render() {
		return <div
			ref={this.mermaidRef}
			className="mermaid"
		>
			{this.state.chart}
		</div>;
	}
}
