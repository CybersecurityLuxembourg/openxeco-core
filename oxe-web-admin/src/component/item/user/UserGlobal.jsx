import React from "react";
import "./UserGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";

export default class UserGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveUserValue = this.saveUserValue.bind(this);

		this.state = {
			user: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		getRequest.call(this, "user/get_user/" + this.props.id, (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveUserValue(prop, value) {
		if (this.state.user[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "user/update_user", params, () => {
				const user = { ...this.state.user };

				user[prop] = value;
				this.setState({ user });
				nm.info("The property has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				{this.state.user !== null
					? <div className="col-md-12">
						<FormLine
							label={"ID"}
							value={this.state.user.id}
							disabled={true}
						/>
						<FormLine
							label={"Email"}
							value={this.state.user.email}
							disabled={true}
						/>
						<FormLine
							label={"First name"}
							value={this.state.user.first_name}
							onBlur={(s) => this.saveUserValue("first_name", s)}
						/>
						<FormLine
							label={"Last name"}
							value={this.state.user.last_name}
							onBlur={(s) => this.saveUserValue("last_name", s)}
						/>
						<br/>
						<FormLine
							label="Is admin"
							type={"checkbox"}
							value={this.state.user.is_admin}
							onChange={(s) => this.saveUserValue("is_admin", s)}
						/>
						<FormLine
							label="Is active"
							type={"checkbox"}
							value={this.state.user.is_active}
							onChange={(s) => this.saveUserValue("is_active", s)}
						/>
						<br/>
						<FormLine
							label="Accept to receive communications"
							type={"checkbox"}
							value={this.state.user.accept_communication}
							disabled={true}
						/>
					</div>
					: <Loading/>
				}
			</div>
		);
	}
}
