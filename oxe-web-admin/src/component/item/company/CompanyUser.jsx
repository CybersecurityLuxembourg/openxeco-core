import React from "react";
import "./CompanyUser.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import Loading from "../../box/Loading.jsx";
import Table from "../../table/Table.jsx";
import User from "../User.jsx";

export default class CompanyUser extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			users: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			workforces: null,
			sources: null,
		});

		getRequest.call(this, "company/get_company_users/" + this.props.id, (data) => {
			this.setState({
				users: data,
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
