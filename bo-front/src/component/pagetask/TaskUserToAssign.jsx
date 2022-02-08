import React from "react";
import "./TaskUserToAssign.css";
import { NotificationManager as nm } from "react-notifications";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";
import User from "../item/User.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class TaskUserToAssign extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.fetchUsers = this.fetchUsers.bind(this);
		this.markAsTreated = this.markAsTreated.bind(this);

		this.state = {
			users: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			users: null,
		}, () => {
			this.fetchUsers();
		});
	}

	fetchUsers(page) {
		const filters = {
			company_assignment_to_treat: true,
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "user/get_users?" + dictToURI(filters), (data) => {
			this.setState({
				users: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	markAsTreated(userId) {
		const params = {
			id: userId,
			company_on_subscription: null,
			department_on_subscription: null,
		};

		postRequest.call(this, "user/update_user", params, () => {
			nm.info("The user has been marked as treated");
			this.refresh();
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
		const columns = [
			{
				Header: "Title",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<User
						id={value.id}
						email={value.email}
						afterDeletion={() => this.refresh()}
					/>
				),
				width: 300,
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"This action will remove the company and department information "
							+ "the user provided when subscribing. Do you want to continue?"}
						trigger={
							<button
								className={"small-button Table-right-button"}>
								<i className="fas fa-check"/>
							</button>
						}
						afterConfirmation={() => this.markAsTreated(value.id)}
					/>
				),
				width: 20,
			},
		];

		return (
			<div id="TaskUserToAssign" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>User to assign</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				{!this.state.users
					&& <div className={"row row-spaced"}>
						<Loading
							height={300}
						/>
					</div>
				}

				{this.state.users && this.state.users.pagination.total === 0
					&& <div className={"row row-spaced"}>
						<Message
							text={"No user to assign found"}
							height={300}
						/>
					</div>
				}

				{this.state.users && this.state.users.pagination.total > 0
					&& <div className={"row row-spaced"}>
						{this.state.users
							? <div className="col-md-12">
								<DynamicTable
									columns={columns}
									data={this.state.users.items}
									pagination={this.state.users.pagination}
									changePage={this.fetchUsers}
								/>
							</div>
							: ""}
					</div>
				}
			</div>
		);
	}
}
