import math
from pyexpat import model
from xml.parsers.expat import model


def calculate_free_space_path_loss(frequency_mhz, distance_km):

    # create variable named fspl_db
    # formula:
    # FSPL = 32.44 + 20log10(frequency_mhz) + 20log10(distance_km)
    fspl_db = 32.44 + 20 * math.log10(frequency_mhz) + 20 * math.log10(distance_km)

    # return fspl_db
    return fspl_db


def calculate_received_power(
    tx_power_dbm,
    tx_antenna_gain_dbi,
    rx_antenna_gain_dbi,
    path_loss_db
):

    # create variable named received_power_dbm
    # formula:
    # received_power = tx_power + tx_gain + rx_gain - path_loss
    received_power_dbm = tx_power_dbm + tx_antenna_gain_dbi + rx_antenna_gain_dbi - path_loss_db

    # return received_power_dbm
    return received_power_dbm


def calculate_link_margin(received_power_dbm, receiver_sensitivity_dbm):

    # create variable named link_margin_db
    # formula:
    # link_margin = received_power - receiver_sensitivity
    link_margin_db = received_power_dbm - receiver_sensitivity_dbm

    # return link_margin_db
    return link_margin_db


def analyze_link_budget(
    tx_power_dbm,
    tx_antenna_gain_dbi,
    rx_antenna_gain_dbi,
    frequency_mhz,
    distance_km,
    receiver_sensitivity_dbm,
    model="free_space"
):

    # calculate path loss using variable path_loss_db
    path_loss_db = calculate_path_loss(frequency_mhz, distance_km, model)

    # calculate received power using variable received_power_dbm
    received_power_dbm = calculate_received_power(
        tx_power_dbm,
        tx_antenna_gain_dbi,
        rx_antenna_gain_dbi,
        path_loss_db
    )

    # calculate link margin using variable link_margin_db
    link_margin_db = calculate_link_margin(received_power_dbm, receiver_sensitivity_dbm)

    # return dictionary with:
    # free_space_path_loss_db
    # received_power_dbm
    # link_margin_db
    return {
    "free_space_path_loss_db": round(path_loss_db, 2),
    "received_power_dbm": round(received_power_dbm, 2),
    "link_margin_db": round(link_margin_db, 2)
    }

def calculate_path_loss(frequency_mhz, distance_km, model="free_space"):

    # if model is "free_space"
        # use calculate_free_space_path_loss()
    if model == "free_space":
        return calculate_free_space_path_loss(frequency_mhz, distance_km)

    # if model is "urban"
        # use free-space path loss + 15 dB extra loss
    if model == "urban":
        return calculate_free_space_path_loss(frequency_mhz, distance_km) + 15

    # if model is "suburban"
        # use free-space path loss + 8 dB extra loss
    if model == "suburban":
        return calculate_free_space_path_loss(frequency_mhz, distance_km) + 8

    # otherwise return free-space path loss
    return calculate_free_space_path_loss(frequency_mhz, distance_km)