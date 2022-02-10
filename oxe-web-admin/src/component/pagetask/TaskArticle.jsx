import React from "react";
import "./TaskArticle.css";
import { NotificationManager as nm } from "react-notifications";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";
import Article from "../item/Article.jsx";
import { getRequest } from "../../utils/request.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class TaskArticle extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.fetchArticles = this.fetchArticles.bind(this);

		this.state = {
			articles: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			articles: null,
		}, () => {
			this.fetchArticles();
		});
	}

	fetchArticles() {
		const filters = {
			status: "UNDER REVIEW",
		};

		getRequest.call(this, "article/get_articles?" + dictToURI(filters), (data) => {
			this.setState({
				articles: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="TaskArticle" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Article to review</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				{this.state.articles === null
					&& <div className={"row row-spaced"}>
						<Loading
							height={300}
						/>
					</div>
				}

				{this.state.articles !== null && this.state.articles.length === 0
					&& <div className={"row row-spaced"}>
						<Message
							text={"No request found"}
							height={300}
						/>
					</div>
				}

				{this.state.articles !== null && this.state.articles.length > 0
					&& <div className={"row row-spaced"}>
						{this.state.articles !== null
							? <div className="col-md-12">
								{this.state.articles
									.map((r) => (
										<Article
											key={"article-" + r.id}
											id={r.id}
											name={r.title}
										/>
									))}
							</div>
							: ""}
					</div>
				}
			</div>
		);
	}
}
