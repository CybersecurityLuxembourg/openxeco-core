import React from "react";
import "./CampaignList.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import Campaign from "../item/Campaign.jsx";
import Loading from "../box/Loading.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class CampaignList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			campaigns: null,
			pagination: null,
			page: 1,
		};
	}

	componentDidMount() {
		this.fetchCampaigns();
	}

	fetchCampaigns(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "campaign/get_campaigns?" + dictToURI(filters), (data) => {
			this.setState({
				campaigns: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addCampaign() {
		postRequest.call(this, "campaign/add_campaign", {}, () => {
			nm.info("The campaign has been added");
			this.fetchCampaigns();
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
				Header: "Campaign",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Campaign
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
			<div id="CampaignList" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h1>Campaigns</h1>
					</div>

					<div className="col-md-3 row-spaced">
						<div className="top-right-buttons">
							<button
								onClick={() => this.fetchCampaigns()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogConfirmation
								text={"Do you want to add a campaign?"}
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								afterConfirmation={() => this.addCampaign()}
							/>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className={"col-md-12 row-spaced"}>
						{this.state.campaigns
							? <DynamicTable
								columns={columns}
								data={this.state.campaigns}
								pagination={this.state.pagination}
								changePage={(p) => this.fetchCampaigns(p)}
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
