import React from "react";
import "./CampaignTemplates.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import CampaignTemplate from "../item/CampaignTemplate.jsx";
import Loading from "../box/Loading.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class CampaignTemplates extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			templates: null,
			pagination: null,
			page: 1,
		};
	}

	componentDidMount() {
		this.fetchTemplates();
	}

	fetchTemplates(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "campaign/get_campaign_templates?" + dictToURI(filters), (data) => {
			this.setState({
				templates: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addTemplate() {
		postRequest.call(this, "campaign/add_campaign_template", {}, () => {
			nm.info("The template has been added");
			this.fetchTemplates();
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
				Header: "Template",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<CampaignTemplate
						info={value}
						onClose={() => this.fetchTemplates(this.state.page)}
					/>
				),
				width: 300,
			},
		];

		return (
			<div id="CampaignTemplates" className="max-sized-page">
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Templates</h1>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<button
								onClick={() => this.fetchTemplates()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogConfirmation
								text={"Do you want to add a template?"}
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								afterConfirmation={() => this.addTemplate()}
							/>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className={"col-md-12 row-spaced"}>
						{this.state.templates
							? <DynamicTable
								columns={columns}
								data={this.state.templates}
								pagination={this.state.pagination}
								changePage={(p) => this.fetchTemplates(p)}
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
