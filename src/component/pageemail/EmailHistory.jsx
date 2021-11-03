import React from "react";
import "./EmailHistory.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import { getRequest } from "../../utils/request.jsx";
/* import DialogConfirmation from "../dialog/DialogConfirmation.jsx"; */
import FormLine from "../button/FormLine.jsx";

export default class EmailHistory extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			rssFeeds: null,
		};
	}

	componentDidMount() {
		this.refresh();
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

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		/* const columns = [
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
		]; */

		if (!this.state.rssFeeds) {
			return <Loading
				height={300}
			/>;
		}

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
				</div>
			</div>
		);
	}
}
