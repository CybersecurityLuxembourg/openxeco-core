import React from "react";
import "./EmailHistory.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import Communication from "../item/Communication.jsx";
import Loading from "../box/Loading.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class EmailHistory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			communications: null,
			selectedCommunication: null,
			pagination: null,
			page: 1,
		};
	}

	componentDidMount() {
		this.fetchCommunications();
	}

	fetchCommunications(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "communication/get_communications?" + dictToURI(filters), (data) => {
			this.setState({
				communications: data.items,
				pagination: data.pagination,
				page,
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
		const columns = [
			{
				Header: "Subject",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Communication
						info={value}
					/>
				),
				width: 300,
			},
			{
				Header: "Status",
				accessor: "status",
			},
			{
				Header: "System date",
				accessor: "sys_date",
			},
		];

		return (
			<div id="EmailHistory" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12 row-spaced">
						<h1>History of communications</h1>
					</div>

					<div className={"col-md-12 row-spaced"}>
						{this.state.communications
							? <DynamicTable
								columns={columns}
								data={this.state.communications}
								pagination={this.state.pagination}
								changePage={this.fetchDataControls}
							/>
							: <Loading
								height={250}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
