import math


def db_to_linear(db_value: float) -> float:
    """
    Convert dB to linear scale.
    """
    return 10 ** (db_value / 10)

def linear_to_db(linear_value: float) -> float:
    """
    Convert linear scale to dB.
    """
    return 10 * math.log10(linear_value)

def dbm_to_mw(dbm_value: float) -> float:
    """
    Convert dBm to milliwatts.
    """
    return 10 ** (dbm_value / 10)
    
def mw_to_dbm(mw_value: float) -> float:
    """
    Convert milliwatts to dBm.
    """
    return 10 * math.log10(mw_value)