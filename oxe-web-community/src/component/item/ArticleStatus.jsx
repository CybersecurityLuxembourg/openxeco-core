import React, { Component } from "react";
import "./ArticleStatus.css";
import DialogMessage from "../dialog/DialogMessage.jsx";

export default class ArticleStatus extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		if (this.props.status === null) {
			return <div className="ArticleStatus ArticleStatus-online">
				Loading&#160; <i className="fas fa-spinner ArticleStatus-loading-logo"/>
			</div>;
		}

		if (this.props.status.length === 0) {
			return <DialogMessage
				trigger={<div className="ArticleStatus ArticleStatus-online">
					Online&#160; <i className="fas fa-info-circle"/>
				</div>}
				text={<div>
					<p>This article is visible publicly.</p>
					<p>
						If you want to make it private, you can change
						the status to &#34;DRAFT&#34; or &#34;ARCHIVE&#34;
						on the metadata of the article.
					</p>
				</div>}
			/>;
		}

		return <DialogMessage
			trigger={<div className="ArticleStatus ArticleStatus-offline">
				Offline&#160; <i className="fas fa-info-circle"/>
			</div>}
			text={<div>
				Why is the article offline?
				<ul>
					{this.props.status.map((r, i) => <li key={"dae-" + i}>
						{r}
					</li>)}
				</ul>
			</div>}
		/>;
	}
}
