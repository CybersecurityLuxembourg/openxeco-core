import React from "react";
import "./NetworkArticles.css";

export default class NetworkArticles extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="NetworkArticles" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Articles</h1>
					</div>

					<div className="col-md-12">
						In construction
					</div>
				</div>
			</div>
		);
	}
}
