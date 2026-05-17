import math

from app.utils.conversions import (
    db_to_linear,
    linear_to_db
)

def calculate_total_gain(stages):
    """
    Calculate total cascaded gain in dB.
    """
    total_gain = 0

    for stage in stages:
        total_gain += stage['gain_db']

    return total_gain

def calculate_total_noise_figure(stages):
    """
    Calculate cascaded noise figure using Friss equation.
    """

    if len(stages) == 0:
        return 0
    
    # Convert first stage NF from dB to linear
    total_nf_linear = db_to_linear(stages[0]["noise_figure_db"])

    cumulative_gain_linear = db_to_linear(stages[0]["gain_db"])

    # Remaining stages
    for stage in stages[1:]:
        stage_nf_linear = db_to_linear(stage["noise_figure_db"])

        total_nf_linear += (
            (stage_nf_linear - 1)
            / cumulative_gain_linear
        )

        cumulative_gain_linear *= db_to_linear(
            stage["gain_db"]
        )

    return linear_to_db(total_nf_linear)

def analyze_receiver_chain(stages):
    """
    Main RF cascade analysis function.
    """

    total_gain = calculate_total_gain(stages)
    total_noise_figure = calculate_total_noise_figure(stages)
    input_ip3 = calculate_input_referred_ip3(stages)

    return {
        "total_gain_dB": round(total_gain, 2),
        "total_noise_figure_dB": round(total_noise_figure, 2),
        "input_ip3_dBm": round(input_ip3, 2) if input_ip3 is not None else None,
    }

def calculate_input_referred_ip3(stages):
    """
    Estimate cascaded input-referred IP3 in dBm.
    """

    ip3_terms = []
    cumulative_gain_linear = 1

    for stage in stages:
        if stage.get("ip3_dbm") is None:
            continue
            
        stage_iip3_mw = 10 ** (stage["ip3_dbm"] / 10)

        ip3_terms.append(
            cumulative_gain_linear / stage_iip3_mw
        )

        cumulative_gain_linear *= db_to_linear(stage["gain_db"])

    if len(ip3_terms) == 0:
        return None

    total_iip3_mw = 1 / sum(ip3_terms)

    return 10 * math.log10(total_iip3_mw)
