import React from "react";
import "./DashboardRecentActivity.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Company from "../item/Company.jsx";
import Article from "../item/Article.jsx";

export default class DashboardRecentActivity extends React.Component {
	constructor(props) {
		super(props);

		this.getLastNews = this.getLastNews.bind(this);
		this.getLastEvents = this.getLastEvents.bind(this);

		this.state = {
			lastEvents: null,
			lastNews: null,
			lastJobOffer: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getLastNews();
		this.getLastEvents();
		this.getLastJobOffer();
	}

	getLastNews() {
		this.setState({ lastNews: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=NEWS&per_page=5", (data) => {
				this.setState({
					lastNews: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLastEvents() {
		this.setState({ lastEvents: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=EVENT&per_page=5", (data) => {
				this.setState({
					lastEvents: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLastJobOffer() {
		this.setState({ lastJobOffer: null }, () => {
			getRequest.call(this, "public/get_public_articles?type=JOB OFFER&per_page=5", (data) => {
				this.setState({
					lastJobOffer: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	render() {
		return (
			<div className={"DashboardRecentActivity row row-spaced"}>
				<div className="col-md-6 row-spaced">
					<h4>
						<i className="fas fa-building"/>
						<br/>
						Recently added entities
					</h4>

					<div>
						{this.props.companies
							? this.props.companies
								.slice(Math.max(this.props.companies.length - 5, 0))
								.reverse()
								.map((o) => (
									<Company
										key={o.id}
										id={o.id}
										name={o.name}
										legalStatus={o.legal_status}
									/>
								))
							: <Loading
								height={160}
							/>
						}
					</div>
				</div>

				<div className="col-md-6 row-spaced">
					<h4>
						<i className="fas fa-newspaper"/>
						<br/>
						Last public news
					</h4>

					<div>
						{this.state.lastNews
							? this.state.lastNews.items.map((o) => (
								<Article
									key={o.id}
									id={o.id}
									name={o.title}
									afterDeletion={() => this.refresh()}
								/>
							))
							: <Loading
								height={160}
							/>
						}
					</div>
				</div>

				<div className="col-md-6 row-spaced">
					<h4>
						<i className="fas fa-calendar-alt"/>
						<br/>
						Last public events
					</h4>

					<div>
						{this.state.lastEvents
							? this.state.lastEvents.items.map((o) => (
								<Article
									key={o.id}
									id={o.id}
									name={o.title}
									afterDeletion={() => this.refresh()}
								/>
							))
							: <Loading
								height={160}
							/>
						}
					</div>
				</div>

				<div className="col-md-6 row-spaced">
					<h4>
						<i className="fas fa-briefcase"/>
						<br/>
						Last public job offers
					</h4>

					<div>
						{this.state.lastJobOffer
							? this.state.lastJobOffer.items.map((o) => (
								<Article
									key={o.id}
									id={o.id}
									name={o.title}
									afterDeletion={() => this.refresh()}
								/>
							))
							: <Loading
								height={160}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
