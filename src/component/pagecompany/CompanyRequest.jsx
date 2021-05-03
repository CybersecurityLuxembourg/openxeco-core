import React from "react";
import "./CompanyGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Info from "../box/Info.jsx";
import Request from "../item/Request.jsx";
import FormLine from "../form/FormLine.jsx";

export default class CompanyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.getRequests = this.getRequests.bind(this);
		this.afterDelete = this.afterDelete.bind(this);

		this.state = {
			requests: null,
			text: null,
		};
	}

	componentDidMount() {
		this.getRequests();
	}

	getRequests() {
		this.setState({
			requests: null,
		});

		getRequest.call(this, "private/get_my_company_requests/" + this.props.companyId, (data) => {
			this.setState({
				requests: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	afterDelete() {
		this.getRequests();
		this.props.getNotifications();
	}

	render() {
		if (this.state.requests === null
			|| this.state.requests === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="CompanyGlobal" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Request</h2>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h3>Current requests</h3>
					</div>

					<div className="col-md-12">
						{this.state.requests.length === 0
							&& <Message
								text={"No request found for this entity"}
								height={300}
							/>
						}

						{this.state.requests.map((r, y) => <div className="col-md-12" key={y}>
							<Request
								info={r}
								afterDelete={this.afterDelete}
							/>
						</div>)}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h3>Issue a new request</h3>
					</div>

					<div className="col-md-12">
						<Info
							content={
								<div>
									You can do any request regarding {this.props.companyName}.<br/>
									One of our operators of the project will reply you back in the shortest delay.
								</div>
							}
						/>
						<FormLine
							label={"Message"}
							type={"textarea"}
							fullWidth={true}
							value={this.state.text}
							onChange={(v) => this.setState({ text: v })}
						/>
						<div className="right-buttons">
							<button
								onClick={this.submitRequest}
								disabled={this.state.text === null || this.state.text.length === 0}>
								<i className="fas fa-paper-plane"/> Submit request
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
