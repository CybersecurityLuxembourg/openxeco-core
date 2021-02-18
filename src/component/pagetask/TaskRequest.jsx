import React from 'react';
import './TaskRequest.css';
import Loading from "../box/Loading";
import Table from '../table/Table';
import Group from '../item/Group';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import DialogConfirmation from '../dialog/DialogConfirmation';


export default class TaskRequest extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			requests: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
	}

	refresh() {
		this.setState({
            users: null
        });

        getRequest.call(this, "request/get_requests", data => {
            this.setState({
                requests: data
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		return (
			<div id="TaskRequest" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Request</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}