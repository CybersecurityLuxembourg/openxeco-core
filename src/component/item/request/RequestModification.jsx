import React, { Component } from 'react';
import './RequestModification.css';
import Popup from "reactjs-popup";
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';
import DialogConfirmation from '../../dialog/DialogConfirmation';
import Message from "../../box/Message";
import { getApiURL } from '../../../utils/env';


export default class RequestModification extends Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);

        this.state = {
            company: null,
            addresses: null,
        }
    }

    componentDidMount() {

        // Parsing the request to recover the json

        let openMatches = this.props.request.match("}");
        let closeMatches = this.props.request.match("}");

        if (openMatches.length === 0) {
            nm.warn("Impossible to parse correctly the data")
            return;
        }


        if (closeMatches.length === 0) {
            nm.warn("Impossible to parse correctly the data")
            return;
        }

        let data = this.props.request.substring(openMatches[0], closeMatches[closeMatches.length-1])

        try {
            a = JSON.parse(data);
        } catch(e) {
            nm.warn("Impossible to parse correctly the data")
        }

        this.setState({
            company: data.company,
            addresses: data.addresses
        })
    }

    onClick() {
        if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
            this.onOpen();

            let newState = !this.props.selected;
            if (typeof this.props.onClick !== "undefined")
                this.props.onClick(this.props.id, newState);
        }
    };

    onClose() {
        this.setState({ isDetailOpened: false });
    }

    onOpen() {
        this.setState({ 
            request: this.props.info,
            isDetailOpened: true, 
            user: null 
        });

        getRequest.call(this, "company/get_company/" + this.props.info.user_id, data => {
            this.setState({
                user: data
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "request/get_request_enums", data => {
            this.setState({
                requestStatus: data["status"]
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    updateRequest(prop, value) {
        if (this.state.request[prop] !== value) {
            let params = {
                id: this.props.info.id,
                [prop]: value,
            }

            postRequest.call(this, "request/update_request", params, response => {
                let request = Object.assign({}, this.state.request);

                request[prop] = value;
                this.setState({ request: request });
                nm.info("The property has been updated");
            }, response => {
                nm.warning(response.statusText);
            }, error => {
                nm.error(error.message);
            });
        }
    }

    render() {
        return (
            <Popup
                className="Popup-small-size"
                trigger={
                    <button
                        className={"blue-background"}
                        onClick={() => this.save()}
                        disabled={typeof this.state.info.id !== "undefined" &&
                            _.isEqual(this.props.info, this.state.info)}
                    >
                        <i className="fas fa-save"/> Review modifications
                    </button>
                }
                modal
                closeOnDocumentClick
                onClose={this.onClose}
                onOpen={this.onOpen}
            >
                <div className="row row-spaced">
                    <div className="col-md-12">
                        <h2>
                            {this.props.info !== undefined && this.props.info !== null ?
                                "Request " + this.props.info.submission_date 
                                : 
                                "Unfound request"
                            }
                        </h2>
                    </div>

                    
                </div>
            </Popup>
        );
    }
}