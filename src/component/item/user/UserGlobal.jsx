import React from 'react';
import './UserGlobal.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';


export default class UserGlobal extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveUserValue = this.saveUserValue.bind(this);

		this.state = {
			user: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

    refresh() {
        getRequest.call(this, "user/get_user/" + this.props.id, data => {
            this.setState({
                user: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    saveUserValue(prop, value) {
        if (this.state.user[prop] !== value) {
            let params = {
                id: this.props.id,
                [prop]: value,
            }

            postRequest.call(this, "user/update_user", params, response => {
                let user = Object.assign({}, this.state.user);

                user[prop] = value;
                this.setState({user: user});
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
		return (
			<div className={"row"}>
                <div className="col-md-12">
                    <h2>Global</h2>
                </div>

				{this.state.user !== null ?
                    <div className="col-md-12">
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
                            label="Is admin"
                            type={"checkbox"}
                            value={this.state.user.is_admin}
                            onChange={s => this.saveUserValue("is_admin", s)}
                        />
                    </div>
                    :
                    <Loading/>
                }

			</div>
		);
	}
}