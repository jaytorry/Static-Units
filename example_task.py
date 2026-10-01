
from typing import Annotated

def calculate_pressure(density: Annotated[float, "kg/m**3"], 
                       height: Annotated[float, "m"]) -> Annotated[float, "Pa"]:

  gravity: Annotated[float, "m/s**2"] = 9.81

  pressure: Annotated[float, "Pa"] = density * gravity * height

  return pressure


class calculator:

  def adder(x: Annotated[float, "dimensionless"], y: Annotated[float, "dimensionless"]) -> Annotated[float, "dimensionless"]:
    total: Annotated[float, "dimensionless"] = x + y
    return total
