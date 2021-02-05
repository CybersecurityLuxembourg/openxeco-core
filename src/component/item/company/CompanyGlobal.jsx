import React from 'react';
import './CompanyGlobal.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';


export default class CompanyGlobal extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveCompanyValue = this.saveCompanyValue.bind(this);

		this.state = {
			company: null,
			companyEnums: null
		}
	}

	componentDidMount() {
		this.refresh();
	}

    refresh() {
        getRequest.call(this, "company/get_company/" + this.props.id, data => {
            this.setState({
                company: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "company/get_company_enums", data => {
            this.setState({
                companyEnums: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    saveCompanyValue(prop, value) {
        if (this.state.company[prop] !== value) {
            let params = {
                id: this.props.id,
                [prop]: value,
            }

            postRequest.call(this, "company/update_company", params, response => {
                let company = Object.assign({}, this.state.company);

                company[prop] = value;
                this.setState({company: company});
                nm.info("The property has been updated");
            }, response => {
                this.refreshCompanyData();
                nm.warning(response.statusText);
            }, error => {
                this.refreshCompanyData();
                nm.error(error.message);
            });
        }
    }

	render() {
		if (this.state.company === null || this.state.companyEnums === null)
        	return <Loading height={300}/>;

		return (
			<div className={"row"}>
                <div className="col-md-12">
                    <h2>Global</h2>
                </div>
				<div className="col-md-12">
                    <FormLine
                        label={"ID"}
                        value={this.state.company.id}
                        disabled={true}
                    />
                    <FormLine
                        type={"image"}
                        label={"Logo"}
                        value={this.state.company.image}
                        onChange={v => this.saveCompanyValue("image", v)}
                        height={150}
                    />
                    <FormLine
                        label={"Name"}
                        value={this.state.company.name}
                        onBlur={v => this.saveCompanyValue("name", v)}
                    />
                    <FormLine
                        label={"Type"}
                        type={"select"}
                        value={this.state.company.type}
                        options={this.state.companyEnums === null || 
                            typeof this.state.companyEnums.type === "undefined" ? [] :
                            this.state.companyEnums.type.map(o => { return {label: o, value: o}})}
                        onChange={v => this.saveCompanyValue("type", v)}
                    />
                    <FormLine
                        label={"Description"}
                        type={"textarea"}
                        value={this.state.company.description}
                        onBlur={v => this.saveCompanyValue("description", v)}
                    />
                    <FormLine
                        label={"RCSL number"}
                        value={this.state.company.rscl_number}
                        onBlur={v => this.saveCompanyValue("rscl_number", v)}
                    />
                    <FormLine
                        label={"Website"}
                        value={this.state.company.website}
                        onBlur={v => this.saveCompanyValue("website", v)}
                    />
                    <FormLine
                        label={"Creation date"}
                        type={"date"}
                        value={this.state.company.creation_date}
                        onChange={v => this.saveCompanyValue("creation_date", v)}
                    />
                    <FormLine
                        label={"Is cybersecurity core business"}
                        type={"checkbox"}
                        value={this.state.company.is_cybersecurity_core_business}
                        onChange={v => this.saveCompanyValue("is_cybersecurity_core_business", v)}
                    />
                    <FormLine
                        label={"Is startup"}
                        type={"checkbox"}
                        value={this.state.company.is_startup}
                        onChange={v => this.saveCompanyValue("is_startup", v)}
                    />
                    <FormLine
                        label={"Is targeting SMEs"}
                        type={"checkbox"}
                        value={this.state.company.is_targeting_sme}
                        onChange={v => this.saveCompanyValue("is_targeting_sme", v)}
                    />
                    <FormLine
                        label={"Editus status"}
                        type={"select"}
                        value={this.state.company.editus_status}
                        options={this.state.companyEnums === null || 
                            typeof this.state.companyEnums.editus_status === "undefined" ? [] :
                            this.state.companyEnums.editus_status.map(o => { return {label: o, value: o}})}
                        onChange={v => this.saveCompanyValue("editus_status", v)}
                    />
                </div>
			</div>
		);
	}
}