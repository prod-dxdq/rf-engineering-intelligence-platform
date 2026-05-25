import math


def db_to_linear(dB_value: float) -> float:
    """
    Convert dB to linear scale.
    """
    return 10 ** (dB_value / 10)

def linear_to_db(linear_value: float) -> float:
    """
    Convert linear scale to dB.
    """
    return 10 * math.log10(linear_value)

def dBm_to_mW(dBm_value: float) -> float:
    """
    Convert dBm to milliwatts.
    """
    return 10 ** (dBm_value / 10)
    
def mW_to_dBm(mW_value: float) -> float:
    """
    Convert milliwatts to dBm.
    """
    return 10 * math.log10(mW_value)


def dbm_to_mw(dbm_value: float) -> float:
    """Backward-compatible alias for dBm_to_mW."""
    return dBm_to_mW(dbm_value)


def mw_to_dbm(mw_value: float) -> float:
    """Backward-compatible alias for mW_to_dBm."""
    return mW_to_dBm(mw_value)