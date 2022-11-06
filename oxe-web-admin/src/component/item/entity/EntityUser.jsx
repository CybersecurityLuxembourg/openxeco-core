import React from "react";
import "./EntityUser.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Table from "../../table/Table.jsx";
import User from "../User.jsx";

export default class EntityUser extends React.Component {
	constructor(props) {
		super(props);

		this.getEntityUsers = this.getEntityUsers.bind(this);
		this.checkForPrimary = this.checkForPrimary.bind(this);

		this.state = {
			users: null,
			contact: null,
		};
	}

	componentDidMount() {
		if (!this.props.node) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			workforces: null,
			sources: null,
		});

		this.getEntityUsers(this.props.id);
	}

	getEntityUsers(entityId) {
		getRequest.call(this, "entity/get_entity_users/" + entityId, (data) => {
			this.setState({
				users: data,
			});
			this.checkForPrimary(entityId);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	checkForPrimary(entityId) {
		getRequest.call(this, "entity/get_entity_contacts/" + entityId, (data) => {
			this.setState({
				users: this.state.users.map((user) => ({ ...user, primary: user.id === data[0].user_id })),
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
		if (this.props.node) {
			return <Message
				text={"Not applicable on remote entity"}
				height={300}
			/>;
		}

		if (this.state.users === null) {
			return <Loading height={300}/>;
		}

		const columns = [
			{
				Header: "User",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<User
						id={value.id}
						email={value.email}
						primary={value.primary}
					/>
				),
			},
		];

		return (
			<div>
				<div className={"row"}>
					<div className="col-md-12">
						<h2>User</h2>
					</div>

					<div className="col-md-12">
						<Table
							columns={columns}
							data={this.state.users}
						/>
					</div>
				</div>
			</div>
		);
	}
}
