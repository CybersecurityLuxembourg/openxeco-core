import React from "react";
import "./ArticleRssFeed.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Info from "../box/Info.jsx";
import Table from "../table/Table.jsx";
import { getRequest, postRequest, getRssFeed } from "../../utils/request.jsx";
import { validateUrl } from "../../utils/re.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import FormLine from "../button/FormLine.jsx";
import RssArticle from "../item/RssArticle.jsx";

export default class ArticleRssFeed extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addRssFeed = this.addRssFeed.bind(this);
		this.deleteRssFeed = this.deleteRssFeed.bind(this);

		this.state = {
			rssFeedField: "",
			rssFeeds: null,
			rssArticles: null,
			requestMessages: [],
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.rssFeeds !== this.state.rssFeeds) {
			this.fetchRssFeeds();
		}
	}

	refresh() {
		this.setState({
			rssFeeds: null,
		}, () => {
			getRequest.call(this, "rss/get_rss_feeds", (data) => {
				this.setState({
					rssFeeds: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	addRssFeed() {
		const params = {
			url: this.state.rssFeedField,
		};

		postRequest.call(this, "rss/add_rss_feed", params, () => {
			this.refresh();
			nm.info("The RSS feed has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteRssFeed(value) {
		const params = {
			url: value,
		};

		postRequest.call(this, "rss/delete_rss_feed", params, () => {
			this.refresh();
			nm.info("The RSS feed has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchRssFeeds() {
		if (this.state.rssFeeds) {
			this.setState({ rssArticles: null, requestMessages: [] }, () => {
				Promise.all(this.state.rssFeeds.map(ArticleRssFeed.fetchRssFeed)).then((data) => {
					console.log(data);
					let rssArticles = [];
					const requestMessages = [];

					data.forEach((d, i) => {
						if (d && d.items) {
							if (d.feed && d.feed.title) {
								d.items.forEach((o) => {
									// eslint-disable-next-line no-param-reassign
									o.source = d.feed.title;
								});
							}

							rssArticles = rssArticles.concat(d.items);
						}

						if (d === "ERROR") {
							requestMessages.push("Error while fetching: " + this.state.rssFeeds[i].url);
						}
					});

					rssArticles.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));

					console.log(rssArticles);
					this.setState({ rssArticles, requestMessages });
				});
			});
		}
	}

	static fetchRssFeed(rssFeed) {
		return new Promise((resolve) => getRssFeed(rssFeed.url, (data) => {
			resolve(data);
		}, () => {
			resolve("ERROR");
		}, () => {
			resolve("ERROR");
		}));
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "URL",
				accessor: "url",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this category?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteRssFeed(value.url)}
					/>
				),
				width: 50,
			},
		];

		return (
			<div id="ArticleRssFeed" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>RSS Feeds</h1>
					</div>

					<div className="col-md-12">
						<FormLine
							label={"Add a RSS Feed"}
							value={this.state.rssFeedField}
							onChange={(v) => this.changeState("rssFeedField", v)}
						/>
					</div>

					<div className="col-md-12 right-buttons">
						<button
							className={"blue-background"}
							onClick={this.addRssFeed}
							disabled={!validateUrl(this.state.rssFeedField)}>
							<i className="fas fa-plus"/> Add RSS Feed
						</button>
					</div>

					<div className="col-md-12">
						{this.state.rssFeeds
							? <div className="fade-in">
								<Table
									columns={columns}
									data={this.state.rssFeeds}
								/>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>

				{this.state.requestMessages.length > 0
					&& <div className={"row row-spaced"}>
						<div className="col-md-12">
							{this.state.requestMessages.map((m, i) => <Info
								key={i}
								content={m}
							/>)}
						</div>
					</div>
				}

				<div className={"row"}>
					<div className="col-md-12">
						<h1>Import news</h1>
					</div>
				</div>

				<div className={"row"}>
					{this.state.rssArticles
						? <div className={"row"}>
							{this.state.rssArticles.map((a, i) => <div
								className="col-md-12"
								key={i}>
								<RssArticle
									info={a}
								/>
							</div>)}
						</div>
						: <div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
