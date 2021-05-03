import React from "react";
import "./PageContact.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./form/FormLine.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Request from "./item/Request.jsx";

export default class PageContact extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.submitRequest = this.submitRequest.bind(this);
		this.afterDelete = this.afterDelete.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			text: null,
			requests: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			requests: null,
		});

		getRequest.call(this, "private/get_my_requests?global_only=true", (data) => {
			this.setState({
				requests: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitRequest() {
		const params = {
			request: this.state.text,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.refresh();
			this.props.getNotifications();
			this.setState({
				text: null,
			});
			nm.info("The request has been submitted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	afterDelete() {
		this.refresh();
		this.props.getNotifications();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id={"PageContact"} className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Contact us</h1>
					</div>

					<div className="col-md-12">
						<h2>Send us a message</h2>

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
								<i className="fas fa-paper-plane"/> Submit message
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Your current messages</h2>

						<div className="top-right-buttons">
							<button
								onClick={this.refresh}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>

					{this.state.requests !== null && this.state.requests.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No message found"}
								height={150}
							/>
						</div>
					}
					{this.state.requests !== null && this.state.requests.length > 0
						&& this.state.requests.map((r) => (
							<div className="col-md-12" key={r.id}>
								<Request
									info={r}
									afterDelete={this.afterDelete}
								/>
							</div>
						))
					}
					{this.state.requests === null
						&& <div className="col-md-12">
							<Loading
								height={150}
							/>
						</div>
					}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-lg-6 col-xl-4">
						<h2>Email</h2>

						<Message
							text={"info@cybersecurity-luxembourg.com"}
							height={150}
						/>
					</div>

					<div className="col-lg-6 col-xl-4">
						<h2>Postal address</h2>

						<Message
							text={<div>
								SECURITYMADEIN.LU g.i.e.<br/>
								16, boulevard d&apos;Avranches<br/>
								L-1160 Luxembourg
							</div>}
							height={150}
						/>
					</div>

					<div className="col-lg-6 col-xl-4">
						<h2>Phone</h2>

						<Message
							text={"(+352) 274 00 98 601"}
							height={150}
						/>
					</div>
				</div>
			</div>
		);
	}
}
