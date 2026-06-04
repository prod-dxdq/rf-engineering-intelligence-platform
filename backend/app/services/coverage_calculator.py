import math

from app.services.link_budget_calculator import calculate_path_loss
from app.services.ml_signal_quality_model import predict_signal_quality

def generate_coverage_prediction(
    tx_power_dbm,
    tx_antenna_gain_dbi,
    rx_antenna_gain_dbi,
    frequency_mhz,
    receiver_sensitivity_dbm,
    model="free_space"
):

    # create empty list named coverage_data
    coverage_data = []

    # create list named distance_values_km
    # use distances from 1 km to 20 km
    distance_values_km = list(range(1, 21))

    # loop through each distance using variable distance_km
    for distance_km in distance_values_km:
        # calculate path loss using variable path_loss_db
        path_loss_db = calculate_path_loss(frequency_mhz, distance_km, model)

        # calculate received power using variable received_power_dbm
        received_power_dbm = (
            tx_power_dbm
            + tx_antenna_gain_dbi
            + rx_antenna_gain_dbi
            - path_loss_db
        )

        # calculate link margin using variable link_margin_db
        link_margin_db = received_power_dbm - receiver_sensitivity_dbm

        # classify signal quality using variable signal_quality
        signal_quality = predict_signal_quality(
            received_power_dbm,
            link_margin_db
        )

        # create boolean named is_covered
        # true if link_margin_db >= 0
        is_covered = link_margin_db >= 0

        # create dictionary named coverage_point
        coverage_point = {
            "distance_km": distance_km,
            "received_power_dbm": round(received_power_dbm, 2),
            "link_margin_db": round(link_margin_db, 2),
            "is_covered": is_covered,
            "signal_quality": signal_quality
        }

        # append coverage_point to coverage_data
        coverage_data.append(coverage_point)

    # create variable named farthest_covered_distance_km
    farthest_covered_distance_km = 0

    # loop through coverage_data using variable point
    for point in coverage_data:
        # if point is covered
        if point["is_covered"]:
            # update farthest_covered_distance_km
            farthest_covered_distance_km = point["distance_km"]

    # return both:
    # coverage_data
    # farthest_covered_distance_km
    return coverage_data, farthest_covered_distance_km

def generate_coverage_comparison(
    tx_power_dbm,
    tx_antenna_gain_dbi,
    rx_antenna_gain_dbi,
    frequency_mhz,
    receiver_sensitivity_dbm
):

    # create empty list named comparison_data
    comparison_data = []

    # create list named models
    models = ["free_space", "urban", "suburban"]

    # create list named distance_values_km
    # distances from 1 km to 20 km
    distance_values_km = list(range(1, 21))

    # loop through each distance using variable distance_km
    for distance_km in distance_values_km:

        # create dictionary named comparison_point
        comparison_point = {
            "distance_km": distance_km
        }

        # store distance_km in comparison_point

        # loop through each model using variable model
        for model in models:
            # calculate path_loss_db
            path_loss_db = calculate_path_loss(frequency_mhz, distance_km, model)

            # calculate received_power_dbm
            received_power_dbm = (
                tx_power_dbm
                + tx_antenna_gain_dbi
                + rx_antenna_gain_dbi
                - path_loss_db
            )

            # store received_power_dbm inside comparison_point using model name as key
            comparison_point[model] = round(received_power_dbm, 2)

        # append comparison_point to comparison_data
        comparison_data.append(comparison_point)

    # return comparison_data
    return comparison_data