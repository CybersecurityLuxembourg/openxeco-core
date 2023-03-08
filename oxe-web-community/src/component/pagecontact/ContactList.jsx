import React from "react";
import "./ContactList.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Request from "../item/Request.jsx";

export default class ContactList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
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

	afterDelete() {
		this.refresh();
		this.props.getNotifications();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id={"ContactList"} className={"max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>My ongoing messages</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<button
							onClick={() => this.refresh()}>
							<i className="fas fa-redo-alt"/>
						</button>
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
									afterDelete={() => this.afterDelete()}
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
			</div>
		);
	}
}
