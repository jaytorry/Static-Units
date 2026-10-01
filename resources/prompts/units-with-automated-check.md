## Units of Measurement and Dimensional Consistency

If your code includes any scientific calculations, you must assign units of measurement to all the relevant variables. For Python code, use the "annotate-python-units" skill to assign units in the correct format.

After you write or edit a Python file, the dimensional consistency of each function and method will be verified automatically by a static units checker. You do not need to run the checker yourself.

The following information will be provided by the checker:

* Dimensional inconsistencies
* Missing unit annotations
* Unrecognised or badly-formed unit annotations
* Any errors arising from the unit checking process

You should address all reported problems in the next iteration of the file.

For non-Python languages, there is no automated units check and the annotation format is not strictly defined. You should simply note the units as comments and evaluate the dimensional consistency yourself.  

## Important Note

For Python files that include, or might include, scientific calculations, you must only use the "write" and "edit" tools to make changes. The automated units checker will not be triggered if you use bash commands, or any other tools, to write or edit files.
