import functools

from flask import request


def check_payload(input_data, payload_format):
    biased_value = []

    for v in payload_format:
        if v['field'] not in input_data:
            if 'optional' not in v or v['optional'] is not True:
                biased_value.append(v['field'])
        elif not isinstance(v['type'], list):
            if 'nullable' not in v or v['nullable'] is False:
                if not isinstance(input_data[v['field']], v['type']):
                    biased_value.append(v['field'])
            else:
                if not isinstance(input_data[v['field']], v['type']) and input_data[v['field']] is not None:
                    biased_value.append(v['field'])

        else:
            if len([t for t in v['type'] if isinstance(input_data[v['field']], t) or
                    (input_data[v['field']] is None and ('nullable' not in v or v['nullable'] is False))]) == 0:
                biased_value.append(v['field'])

    return biased_value


def verify_payload(format_=None):
    def _verify_payload(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            if request.get_json() is None:
                return "", "422 No payload found"

            biased_value = check_payload(request.get_json(), format_)
            if len(biased_value) > 0:
                return "", f"422 Error with those params : {','.join(biased_value)}"

            return f(*args, **kwargs)

        return wrapper
    return _verify_payload
